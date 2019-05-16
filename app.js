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
 * @fileoverview Experiment with particle paths.
 * 
 * @author Luis Mejia <lmejia@gmail.com>
 * 
 * @requires EXTERNAL:@link{https://p5js.org p5.js}
 * @requires p5-ext.js
 * @requires particle-shape.js
 */
'use strict';

class App {

    // constructor() {
    // }

    onSetup() {
        this.figure = new Figure();
        this.figure.originPosition = createVector(width / 2, height * 2 / 3);
        this.figure.originHeading = PI / -2;
        let xoff = random(2000000);
        for (let i = 0; i < 200; ++i) {
            xoff += 0.01;
            const angle = (noise(xoff) - 0.5) * QUARTER_PI / 2;
            this.figure.addSegment(new PathSegment(angle, 3));
        }
        this.paths = [];
        for (let i = 0; i < 10; ++i) {
            const path = new ParticlePath(this.figure);
            this.paths.push(path);
        }
    }

    onUpdate() {
        for (let i = 0; i < 10; ++i) {
            random(this.paths).spawnParticle();
        }
        this.paths.forEach(path => path.update());
    }

    onDraw() {
        background(0);
        // noFill();
        // strokeWeight(2);
        // stroke('#f0f0f0ff');
        // this.figure.draw();
        this.paths.forEach(path => path.draw());
    }
}
