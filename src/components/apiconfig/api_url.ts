export const API_URL = {
  BRANCHES: {
    POST_BRANCHES: 'api/branches',
    EDIT_BRANCHES: 'api/branches',
    GET_BRANCHES: 'api/branches',
  },
  HEAD_MEMBER: {
    POST_HEAD_MEMBER: 'api/family/create/',
    SEARCH_HEAD_MEMBER: 'api/family/search/',
    EDIT_HEAD_MEMBER: (uuid: string) => `api/family/${uuid}/update/`,
  },
  MEMBER: {
    POST_MEMBER: 'api/members/',
    GET_FATHER_NAME: 'api/members/mini/',
    EDIT_MEMBER: (id: number) => `api/members/${id}/`,
  },
  CONTACT: {
    POST_CONTACT: 'api/contacts/',
    EDIT_CONTACT: (id: number) => `api/contacts/${id}/`,
  },
  EMPLOYEMENT: {
    POST_EMPLOYEMENT: 'api/employments/',
    EDIT_EMPLOYEMENT: (id: number) => `api/employments/${id}/`,
  },
  FULL_DETAILS: {
    GET_FULL_DETAILS: 'api/family/full-details/',
  },
  PREVIEW_DETAILS: {
    GET_PREVIEW_DETAILS_WITH_ID: (uuid: string, id: number) =>
      `api/family/${uuid}/member/${id}/`,
  },
};
