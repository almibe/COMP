/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { debug, TODO } from "./debug";
import { StackValue } from "./interpreter";
import { procedures } from "./procedures";

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

export class PopOperation implements Operation {
    run(stack: StackValue[]): void {
        stack.pop()
    }
}

export class CallOperation implements Operation {
    readonly procedureName: string

    constructor(procedureName: string) {
        this.procedureName = procedureName
    }

    run(stack: StackValue[]): void {
        if (this.procedureName == "add") {
            procedures.add(stack)
        } else {
            throw new Error(`${this.procedureName} not supported.`)
        }
    }
}
