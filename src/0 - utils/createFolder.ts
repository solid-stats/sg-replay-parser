import fs from 'fs';

const createFolder = (folderPath: string): void => {
  if (fs.existsSync(folderPath)) return;

  fs.mkdirSync(folderPath);
};

export default createFolder;
