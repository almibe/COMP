/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { debug, TODO } from "./debug";
import { StackValue } from "./interpreter";

export interface Operation {
    run(stack: Array<StackValue>): void
}

export class PushOperation implements Operation {
    readonly value: StackValue

    constructor(value: StackValue) {
        this.value = value
    }

    run(stack: StackValue[]): void {
        stack.push(this.value)
    }
}
