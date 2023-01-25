import * as fs from 'fs';

const readSecret = (secretName: string) => {
  try {
    return fs.readFileSync(`/run/secrets/${secretName}`, 'utf-8').trim();
  } catch (err:any) {
    if (err.code !== 'ENOENT') {
      console.error(`An error occurred while trying to read the secret: ${secretName}. Err: ${err}`);
    } else {
      console.error(`Could not find the secret, Docker probably not running in swarm mode: ${secretName}. Err: ${err}`);
    }    
    return "";
  }
}

export {readSecret};