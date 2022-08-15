import fetch from 'node-fetch';

const fetchData = async <DataType>(url: string): Promise<DataType> => (
  fetch(url).then((res) => res.json())
);

export default fetchData;
