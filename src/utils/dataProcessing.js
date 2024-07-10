export async function fetchData() {
    const appID = kintone.app.getId();
    let allRecords = [];
    let offset = 0;
    const limit = 500;
  
    const getRecord = {
      app: appID,
      query: `limit ${limit} offset ${offset}`
    }
  
    try {
      while (true) {
        const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', getRecord);
        allRecords = allRecords.concat(resp.records);
        offset += limit;
        if (resp.records.length < limit) {
          break;
        }
      }
    } catch (err) {
      console.error(`fetchData: ${err}`);
      throw err;
    }
  
    return allRecords;
}

export function generateCrossTable(records, xKey, yKey, totalKey) {
  const crossTable = {};
  
  records.forEach(record => {
    const xValue = record[xKey]?.value || '未知';
    const yValue = record[yKey]?.value || '未知';
    const totalValue = parseFloat(record[totalKey]?.value || 0);

    if (!crossTable[xValue]) {
      crossTable[xValue] = {};
    }
    
    if (!crossTable[xValue][yValue]) {
      crossTable[xValue][yValue] = 0;
    }
    
    crossTable[xValue][yValue] += totalValue;
  });

  return crossTable;
}

  