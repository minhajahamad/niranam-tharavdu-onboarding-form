export const API_URL = {
  BRANCHES: {
    POST_BRANCHES: 'api/branches',
    EDIT_BRANCHES: 'api/branches',
    GET_BRANCHES: 'api/branches',
  },
  HEAD_MEMBER: {
    POST_HEAD_MEMBER: 'api/family/create/',
    SEARCH_HEAD_MEMBER: 'api/family/search/',
  },
  MEMBER: {
    POST_MEMBER: 'api/members/',
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
  PREVIEW_DETAILS: {
    GET_FULL_DETAILS: 'api/full-details/',
  },
};
