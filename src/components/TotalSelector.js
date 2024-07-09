import React from 'react';
import { Select } from 'antd';
import '../styles/Selector.css';

const { Option } = Select;

const TotalSelector = ({ label, options = [], onChange, selectedKey }) => (
  <div className="select-container">
    <label>{label}</label>
    <Select
      className="selector"
      placeholder={label}
      onChange={onChange}
      value={selectedKey}
    >
      {options.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  </div>
);

export default TotalSelector;
