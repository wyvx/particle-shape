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
  * @fileoverview Classes for shapes and particle paths.
  * 
  * @author Luis Mejia <lmejia@gmail.com>
  */
'use strict';

class PathSegment {

    constructor(angle, distance) {
        this.angle = angle;
        this.distance = distance;
    }

    copy() {
        return new PathSegment(this.angle, this.distance);
    }
}

class Path {

    constructor() {
        this.originPosition = createVector(0, 0);
        this.originHeading = 0;
        this.segments = [];
    }

    copy() {
        const path = new Path();
        path.originPosition = this.originPosition;
        path.originHeading = this.originHeading;
        this.segments.forEach(segment => path.addSegment(segment.copy()));
        return path;
    }

    addSegment(segment) {
        this.segments.push(segment);
    }
}

class Figure extends Path {

    draw() {
        beginShape();
        const position = this.originPosition.copy();
        vertex(position.x, position.y);
        let heading = this.originHeading;
        this.segments.forEach(segment => {
            heading += segment.angle;
            const vector = p5.Vector.fromAngle(heading, segment.distance);
            position.add(vector);
            vertex(position.x, position.y);
        });
        endShape();
    }
}

class ParticlePath extends Path {

    constructor(figure, branchIndex = null, minLength = 50, maxLength = 100) {
        super();
        if (branchIndex == null) {
            branchIndex = floor(random(figure.segments.length));
        }
        const pathPrefix = this.getPathPrefix(figure, branchIndex);
        pathPrefix.forEach(segment => this.addSegment(segment));
        this.originPosition = figure.originPosition;
        this.originHeading = figure.originHeading;
        const length = floor(random(minLength, maxLength));
        this.createSmokePath(length);
        this.pathLength = 0;
        this.segments.forEach(segment => this.pathLength += segment.distance);
        this.particles = [];
    }

    getPathPrefix(figure, branchIndex) {
        const position = figure.originPosition.copy();
        let heading = figure.originHeading;
        const pathPrefix = [];
        for (let i = 0; i < figure.segments.length; ++i) {
            if (i >= branchIndex) {
                break;
            }
            const segment = figure.segments[i];
            heading += segment.angle;
            const vector = p5.Vector.fromAngle(heading, segment.distance);
            position.add(vector);
            pathPrefix.push(segment.copy());
        }
        return pathPrefix;
    }

    createSmokePath(length) {
        let xoff = random(2000000);
        for (let i = 0; i < length; ++i) {
            const angle = (noise(xoff) - 0.5) * HALF_PI / 10;
            const segment = new PathSegment(angle, 2);
            this.addSegment(segment);
            xoff += 0.004;
        }
    }

    spawnParticle() {
        const distanceOffset = random(this.pathLength - 100);
        this.particles.push(new Particle(distanceOffset));
}

    update() {
        const time = millis();
        const _pathLength = this.pathLength;
        this.particles = this.particles.filter(p => {
            p.update(time);
            if (p.distance >= (_pathLength - p.alphaSpeed)) {
                p.fadeOut();
            }
            return p.isAlive;
        });
        this.particles.sort((a, b) => a.distance - b.distance);
        this.calculateParticlePositions();
    }

    calculateParticlePositions() {
        if (this.particles.length == 0) {
            return;
        }
        let particleIndex = 0;
        let remainingDistance = this.particles[particleIndex].distance;
        const position = this.originPosition.copy();
        let heading = this.originHeading;
        for (const segment of this.segments) {
            heading += segment.angle;
            const vector = p5.Vector.fromAngle(heading, segment.distance);
            while (true) {
                if (segment.distance >= remainingDistance) {
                    const workVector = vector.copy();
                    workVector.setMag(remainingDistance);
                    this.particles[particleIndex].position = p5.Vector.add(position, workVector);
                    ++particleIndex;
                    if (particleIndex >= this.particles.length) {
                        return;
                    }
                    remainingDistance += this.particles[particleIndex].distance - this.particles[particleIndex - 1].distance;
                } else {
                    break;
                }
            }
            position.add(vector);
            remainingDistance -= vector.mag();
        }
    }

    draw() {
        push();
        noStroke();
        const particleColor = color('#ffff00ff');
        this.particles.forEach(particle => {
            particleColor.setAlpha(particle.alpha);
            fill(particleColor);
            particle.draw();
        });
        pop();
    }
}

class Particle {

    constructor(distanceOffset = 0, xoffOrigin = null) {
        this.xoffOrigin = xoffOrigin == null ? random(2000000) : xoffOrigin;
        this.speed = random(100, 150);
        this.distance = distanceOffset;
        this.creationTime = millis();
        this.lastTime = this.creationTime;
        this.position = createVector(0, 0);
        this.xoffAngleStart = random(2000000);
        this.xoffAngle = 0;
        this.gap = random(5);
        this.alpha = 255;
        this.alphaDirection = 0;
        this.alphaSpeed = 300;
        this.isAlive = true;
        this.fadeIn();
    }

    update(time) {
        const elapsed = (time - this.creationTime) / 1000;
        const delta = (time - this.lastTime) / 1000;
        this.lastTime = time;
        // this.distance = this.speed * elapsed;
        this.distance += this.speed * delta;
        this.xoffAngle = this.xoffAngleStart + (elapsed * 2);
        if (delta == 0) {
            return;
        }
        switch (this.alphaDirection) {
            case 1:
                this.alpha += this.alphaSpeed * delta;
                if (this.alpha >= 255) {
                    this.alpha = 255;
                    this.alphaDirection = 0;
                }
                break;
            case -1:
                this.alpha -= this.alphaSpeed * delta;
                if (this.alpha <= 0) {
                    this.alpha = 0;
                    this.alphaDirection = 0;
                    this.isAlive = false;
                }
                break;
            default:
                // No-op.
        }
    }

    draw() {
        const vector = p5.Vector.fromAngle(noise((this.xoffAngle) - 0.5) * PI, this.gap);
        vector.add(this.position);
        ellipse(vector.x, vector.y, 2);
    }

    fadeIn() {
        if (this.alphaDirection == 1) {
            return;
        }
        this.alpha = 0;
        this.alphaDirection = 1;
    }

    fadeOut() {
        if (this.alphaDirection == -1) {
            return;
        }
        this.alpha = 255;
        this.alphaDirection = -1;
    }
}
