/**
 * @license
 * Copyright 2016 Google Inc.
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

import {chunkFormatTest} from 'neuroglancer/sliceview/chunk_format_testing';
import {ChunkFormat} from 'neuroglancer/sliceview/uncompressed_chunk_format';
import {TypedArrayConstructor} from 'neuroglancer/util/array';
import {DataType} from 'neuroglancer/util/data_type';
import {prod4, vec3, vec4} from 'neuroglancer/util/geom';
import {getRandomValues} from 'neuroglancer/util/random';

describe('sliceview/uncompressed_chunk_format', () => {
  describe('data access', () => {
    for (let volumeSize of [vec4.fromValues(64, 64, 64, 1), vec4.fromValues(36, 36, 36, 1), ]) {
      const numElements = prod4(volumeSize);
      let data = new Float32Array(numElements);
      for (let i = 0; i < numElements; ++i) {
        data[i] = i;
      }
      const dataType = DataType.FLOAT32;
      chunkFormatTest(dataType, volumeSize, gl => {
        let chunkFormat = ChunkFormat.get(gl, dataType, volumeSize[3]);
        let textureLayout = chunkFormat.getTextureLayout(gl, <vec3>volumeSize.subarray(0, 3));
        return [chunkFormat, textureLayout];
      }, data, data);
    }

    for (let volumeSize of [vec4.fromValues(13, 17, 23, 1), vec4.fromValues(13, 17, 23, 2), ]) {
      const numElements = prod4(volumeSize);
      for (let [dataType, arrayConstructor] of<[DataType, TypedArrayConstructor][]>[
             [DataType.UINT8, Uint8Array], [DataType.UINT16, Uint16Array],
             [DataType.UINT32, Uint32Array], [DataType.UINT64, Uint32Array]
           ]) {
        let texelsPerElement = (dataType === DataType.UINT64) ? 2 : 1;
        let data = new arrayConstructor(numElements * texelsPerElement);
        getRandomValues(data);
        chunkFormatTest(dataType, volumeSize, gl => {
          let chunkFormat = ChunkFormat.get(gl, dataType, volumeSize[3]);
          let textureLayout = chunkFormat.getTextureLayout(gl, <vec3>volumeSize.subarray(0, 3));
          return [chunkFormat, textureLayout];
        }, data, data);
      }
    }
  });
});
