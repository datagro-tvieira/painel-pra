// DateTimeRangePicker.tsx
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from 'dayjs';

const CustomInput = ({ onDateChange, value }) => {
  const [startDate, setStartDate] = useState(new Date());


  useEffect(() => {
    if (value) {
      const parsed = dayjs(value, 'YYYY-MM-DD').toDate();
      if (!isNaN(parsed)) {
        setStartDate(parsed);
      }
    }
  }, [value]);


  const handleChange = (date) => {
    setStartDate(date);
    onDateChange(date); // envia para o pai
  };

  return (
    <div className="flex items-center">
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        className="text-black w-24 rounded-md p-1"
      />
    </div>
  );
};

export default CustomInput;
