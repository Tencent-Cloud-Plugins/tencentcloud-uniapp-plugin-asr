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
 * 生成n位随机码
 * @param {integer} n
 * @param {string} type 类型：string、int
 * @returns {string} sa
 */
export default function randStr(n, type='string'){
  let seed = (type === 'string' ? "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ":'1234567890').split('');
  let sa = "";
  for(let i = 0; i< n; i++){
    let pos = Math.round(Math.random() * (seed.length-1));
    sa += seed[pos];
  }
  return sa
}
