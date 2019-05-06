/**
 * @license
 * Copyright 2019 Luis Mejia
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Experiment with smoky paths.
 * 
 * @author Luis Mejia <lmejia@gmail.com>
 * 
 * @requires EXTERNAL:@link{https://p5js.org p5.js}
 * @requires p5-ext.js
 * @requires smokey.js
 */
'use strict';

class App {

    // constructor() {
    // }

    onSetup() {
        this.figure = new Figure();
        this.figure.originPosition = createVector(width / 2, height * 3 / 4);
        this.figure.originHeading = PI / -2;
        for (let i = 0; i < 200; ++i) {
            this.figure.addSegment(new PathSegment(0, 2));
        }
        this.smokes = [];
        for (let i = 0; i < 10; ++i) {
            const smoke = new Smoke(this.figure);
            this.smokes.push(smoke);
        }
    }

    onUpdate() {
        this.smokes.forEach(smoke => {
            if (floor(random(10)) == 0) {
                smoke.spawnParticle();
            }
            smoke.update();
        });
    }

    onDraw() {
        background(0);
        noFill();
        strokeWeight(2);
        stroke('#f0f0f0ff');
        this.figure.draw();
        stroke('#f0f0f080');
        this.smokes.forEach(smoke => smoke.draw());
    }
}
