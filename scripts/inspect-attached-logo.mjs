import fs from 'fs';

const attached =
  'C:/Users/micha/.cursor/projects/c-Users-micha-OneDrive-Desktop-REELYOU/assets/c__Users_micha_AppData_Roaming_Cursor_User_workspaceStorage_a4cb8db0f47553862b62d487c127ddee_images_Splash_Screen_Logo_White_letters_Transparent-0a8bd222-2c3c-43d6-9e56-a93b4a758253.png';

const buf = fs.readFileSync(attached);
console.log('First 16 bytes:', buf.slice(0, 16).toString('hex'));
console.log('File size:', buf.length);
console.log('Is JPEG:', buf[0] === 0xff && buf[1] === 0xd8);
console.log('Is PNG:', buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])));
