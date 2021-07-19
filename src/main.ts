import {setFailed} from '@actions/core';
import {execute} from './process';

async function run() {
  try {
    await execute();
  } catch (error) {
    setFailed(error.message);
  }
}

run();