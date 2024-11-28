export const sortQuestionnaires = (questionnaires, sortBy = 'createdAt', order = 'desc') => {
  return [...questionnaires].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return order === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      case 'status':
        return order === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      case 'responses':
        return order === 'asc'
          ? (a.responseCount || 0) - (b.responseCount || 0)
          : (b.responseCount || 0) - (a.responseCount || 0);
      case 'createdAt':
      default:
        return order === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
}; 