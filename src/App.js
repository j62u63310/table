import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import AxisSelector from './components/AxisSelector';
import TotalSelector from './components/TotalSelector';
import { AxisX, AxisY, Totals } from './utils/options';
import { fetchData, generateCrossTable } from './utils/dataProcessing';
import './styles/App.css';

const App = () => {
  const [selectedX, setSelectedX] = useState(null);
  const [selectedY, setSelectedY] = useState(null);
  const [selectedTotal, setSelectedTotal] = useState(null);
  const [data, setData] = useState([]);
  const [crossTable, setCrossTable] = useState(null);

  const handleGenerate = async () => {
    try {
      const records = await fetchData();
      setData(records);
      console.log('Fetched Records:', records);

      if (!selectedX || !selectedY || !selectedTotal) {
        console.error('Selected values are not valid:', { selectedX, selectedY, selectedTotal });
        return;
      }

      const table = generateCrossTable(records, selectedX, selectedY, selectedTotal);
      console.log('Generated Cross Table:', table);
      setCrossTable(table);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleExport = () => {
    if (!crossTable) return;

    const columns = [{ title: '\\', dataIndex: 'key', key: 'key' }];
    const dataSource = [];

    Object.keys(crossTable).forEach(xKey => {
      const row = { '\\': xKey };
      Object.keys(crossTable[xKey]).forEach(yKey => {
        if (!columns.find(col => col.title === yKey)) {
          columns.push({ title: yKey, dataIndex: yKey, key: yKey });
        }
        row[yKey] = crossTable[xKey][yKey];
      });
      dataSource.push(row);
    });

    const ws = XLSX.utils.json_to_sheet(dataSource, { header: columns.map(col => col.title) });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'cross_table.xlsx');
  };

  const handleXChange = (value) => {
    setSelectedX(value);
    if (value === selectedY) {
      setSelectedY(null);
    }
  };

  const handleYChange = (value) => {
    setSelectedY(value);
    if (value === selectedX) {
      setSelectedX(null);
    }
  };

  const isButtonDisabled = !selectedX || !selectedY || !selectedTotal;

  const renderCrossTable = () => {
    if (!crossTable) return null;

    const columns = [{ title: '', dataIndex: 'key', key: 'key', className: 'table-header-y', width: 100 }];
    const dataSource = [];

    Object.keys(crossTable).forEach(xKey => {
      const row = { key: xKey };
      Object.keys(crossTable[xKey]).forEach(yKey => {
        if (!columns.find(col => col.title === yKey)) {
          columns.push({ title: yKey, dataIndex: yKey, key: yKey, className: 'table-cell', width: 100 });
        }
        row[yKey] = crossTable[xKey][yKey];
      });
      dataSource.push(row);
    });

    console.log('Table Columns:', columns);
    console.log('Table DataSource:', dataSource);

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 'max-content', y: 500 }} // 設置滾動條的寬度和高度
        rowClassName={(record, index) => index === 0 ? 'table-header' : ''} // 縱軸第一欄樣式
      />
    );
  };

  return (
    <div className="container">
      <div className="selectors-row">
        <AxisSelector
          label="縱軸"
          options={AxisX}
          onChange={handleXChange}
          selectedKey={selectedX}
        />
        <AxisSelector
          label="橫軸"
          options={AxisY.filter(option => option.value !== selectedX)} // 過濾已選中的X軸
          onChange={handleYChange}
          selectedKey={selectedY}
        />
        <TotalSelector
          label="合計"
          options={Totals}
          onChange={setSelectedTotal}
          selectedKey={selectedTotal}
        />
      </div>
      <div className="buttons-row">
        <Button type="primary" onClick={handleGenerate} className="generate-button" disabled={isButtonDisabled}>
          產生表格
        </Button>
        <Button type="default" onClick={handleExport} className="export-button" disabled={!crossTable}>
          匯出Excel
        </Button>
      </div>
      {renderCrossTable()}
    </div>
  );
};

export default App;
