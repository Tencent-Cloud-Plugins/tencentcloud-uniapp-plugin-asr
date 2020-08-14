/*
 * Copyright (C) 2020 Tencent Cloud.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/**
 * blob文件转换base64格式
 * @param {object} blob 需要转换的文件
 * @returns {Promise<string>} result // base64格式的音频
 */
export async function blob2Base64(file) {
  return new Promise((resolve, reject) => {
    try {
      let fileReader = new FileReader();
      fileReader.onloadend = async () => {
        resolve(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * blob文件转换ArrayBuffer格式
 * @param {object} blob 需要转换的文件
 * @returns {Promise<object>} result // ArrayBuffer格式的音频
 */
export async function blob2ArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    try {
      let fileReader = new FileReader();
      fileReader.onloadend = async () => {
        resolve(fileReader.result);
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
}
