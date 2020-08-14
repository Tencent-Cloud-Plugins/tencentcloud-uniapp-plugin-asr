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

function apis() {}
// 参数首字母大写转换
export function toUpperCase(obj) {
  if (typeof obj === "object") {
    const formatObj = Object.keys(obj).reduce((newObj, key) => {
      let newKey = key.substring(0, 1).toUpperCase() + key.substring(1);
      newObj[newKey] = obj[key];
      return newObj;
    }, {});
    return formatObj;
  } else {
    throw new Error("参数需要为object类型");
  }
}

function apiCreater(name){
  if (!name) new Error("请传入ASR对应Action名称");
  return async function (args) {
    if(args.sourceType===1 && !args.dataLen){
      throw new Error("需要填写数据长度");
    }
    try {
      // 将参数key的首字母大写
      const payload = toUpperCase(args);
      // 调用云函数来进行OCR识别
      const result = await uniCloud.callFunction({
        name: "tencentcloud-plugin",
        data: {
          module: "ASR",
          action: "getAsrResult",
          name: name,
          payload,
        },
      });
      return result
    } catch (e) {
      throw new Error(e);
    }
  };
}

// 云API对应的ActionName
const function_names = [
  'SentenceRecognition',  //  一句话识别
  'CreateRecTask',  // 录音文件识别请求
  'DescribeTaskStatus',  //  录音文件识别结果查询
  'RealtimeVoice' // 实时语音
]

for (var i = 0; i < function_names.length; i++) {
  let name = function_names[i];
  apis[name.charAt(0).toLowerCase() + name.slice(1)] = apiCreater(
    function_names[i]
  );
}

export default apis