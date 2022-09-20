export const FirebaseDateTransforrmer = (data: any) => {
  if (!data) {
    return undefined;
  }
  if (typeof data === 'object' && data.hasOwnProperty('toDate')) {
    return data.toDate()
  }
  if (typeof data === 'object' && data._seconds) {
    return new Date(data._seconds * 1000)
  }
  return new Date(data);
}
