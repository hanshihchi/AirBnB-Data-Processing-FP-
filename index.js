#!/usr/bin/env node
import { startUI } from './ui.js';

const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.error('Please provide the CSV file path as a parameter.');
  process.exit(1);
}

startUI(csvFilePath);
