/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TODO } from "./debug"
import { Operation } from "./operations"

export type StackValue = number

export function interpret(operations: Array<Operation>): StackValue {
    let stack: Array<StackValue> = new Array()

    for (let operation in operations) {
        TODO()
    }

    return TODO()
}
