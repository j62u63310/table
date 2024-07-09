import React, { useState } from 'react';
import AxisSelector from './components/AxisSelector';
import TotalSelector from './components/TotalSelector';
import { Button, Table } from 'antd';
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

    const columns = [{ title: '', dataIndex: 'key', key: 'key' }];
    const dataSource = [];

    Object.keys(crossTable).forEach(xKey => {
      const row = { key: xKey };
      Object.keys(crossTable[xKey]).forEach(yKey => {
        if (!columns.find(col => col.title === yKey)) {
          columns.push({ title: yKey, dataIndex: yKey, key: yKey });
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
        scroll={{ x: 1000, y: 500 }} // 設置滾動條的寬度和高度
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
      <Button type="primary" onClick={handleGenerate} className="generate-button" disabled={isButtonDisabled}>
        產生表格
      </Button>
      {renderCrossTable()}
    </div>
  );
};

export default App;
