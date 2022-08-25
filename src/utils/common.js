export const numberToDate = (dataItem) => {
  if (!dataItem) return null;
  dataItem.JoinDate = dataItem.JoinDate && new Date(dataItem.JoinDate);
  return dataItem;
};
