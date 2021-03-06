import { MutationTree, ActionTree, ActionContext, Module, GetterTree } from 'vuex';
import fetch, { IFetchInit, newsItemRequest, newsListRequest } from '../fetch';

/**
 * State
 */
interface INewsState {
  detailNewsIds: Array<number>,
  listNewsIds: Array<number>
};

const state: INewsState = {
  detailNewsIds: [],
  listNewsIds: []
};

/**
 * Getter
 */
const getters: GetterTree<INewsState, any> = {
  list(
    state: INewsState,
    getters: GetterTree<INewsState, any>,
    rootState: any,
    rootGetter: any
  ): any {
    return rootGetter.getListFromCache({
      type: 'news',
      ids: state.listNewsIds
    });
  },

  item(
    state: INewsState,
    getters: GetterTree<INewsState, any>,
    rootState: any,
    rootGetter: any
  ): Function {
    return (newsId: number) => {
      if (!state.detailNewsIds.includes(newsId)) {
        return null;
      }
  
      return rootGetter.getItemFromCache({
        type: 'news',
        id: newsId
      });
    }
  }
};

/**
 * Mutations
 */
const NEWS_FETCH = 'NEWS_FETCH';
const NEWS_LIST_FETCH = 'NEWS_LIST_FETCH';
const mutations: MutationTree<INewsState> = {

  /**
   * get news
   * @param state state
   * @param payload news
   */
  [NEWS_FETCH](state: INewsState, payload: number): void {
    if (state.detailNewsIds.includes(payload)) {
      return;
    }

    state.detailNewsIds.push(payload);
  },

  /**
   * get news list
   * @param state state
   * @param payload news list
   */
  [NEWS_LIST_FETCH](state: INewsState, payload: Array<number>): void {
    state.listNewsIds = payload;
  }
}

/**
 * Action
 */
const actions: ActionTree<INewsState, any> = {
  getItem({ state, commit, getters }: ActionContext<INewsState, any>, newsId: number): Promise<any> {
    /**
     * 缓存有可能是“列表”接口获取的，也有可能是“详情”接口获取的，所以必须判断缓存的有效性：
     * 
     *    state.detailNewsIds 中存在
     *    已经缓存的 news 包含 content 字段
     */
    if (state.detailNewsIds.includes(newsId) && getters.item(newsId).content) {
      return Promise.resolve(null);
    }

    let options: IFetchInit = {
      params: {
        newsId
      }
    };

    return fetch(newsItemRequest, options)
      .then(data => {
        commit(NEWS_FETCH, data);
      });
  },

  getList({ state, commit }: ActionContext<INewsState, any>): Promise<any> {
    if (Array.isArray(state.listNewsIds) && state.listNewsIds.length > 0) {
      return Promise.resolve(null);
    }

    return fetch(newsListRequest)
      .then(data => {
        commit(NEWS_LIST_FETCH, data);
      });
  }
}

const newsModule: Module<INewsState, any> = {
  namespaced: true,
  getters,
  state,
  mutations,
  actions
}

export default newsModule;
