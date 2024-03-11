import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/stoppable";
import "./natives.fc";

@name(pop_10)
native pop_10();

@name(stack_overflow)
native stack_overflow();

@name(type_check_error)
native type_check_error();

@name(set_c5)
native set_c5(c: Cell);

@name(dict_exit_10)
native dict_exit_10();

message Launch {
}
message LaunchFirst {
    queryId: Int as uint64;
    launcher: Address;
}
message LaunchSecond {
    queryId: Int as uint64;
    launcher: Address;
}
message SetFirst {
    queryId: Int as uint64;
}
message FakeLaunch {
    exitCode: Int as uint16;
}

contract Fireworks with Deployable, Ownable, Stoppable {
    id: Int as uint32;
    owner: Address;
    stopped: Bool;

    init(id: Int){
        self.id = id;
        self.owner = sender();
        self.stopped = false;
    }

    fun setFireworksByID(id: Int, mode: Int, value: Int, body: Cell) {
        let newInit: StateInit = initOf Fireworks(id);
        let newAddress: Address = contractAddress(newInit);
        //send a message
        send(SendParameters{
                to: newAddress,
                value: value,
                mode: mode,
                bounce: true,
                body: body,
                code: newInit.code,
                data: newInit.data
            }
        );
    }

    receive(msg: SetFirst){
        let id: Int = self.id();
        let body1: Cell = LaunchFirst{queryId: 0, launcher: sender()}.toCell();
        let body2: Cell = LaunchSecond{queryId: 0, launcher: sender()}.toCell();
        //set First Fireworks
        self.setFireworksByID((id + 1), 0, ton("1"), body1);
        //send LaunchSecond message
        self.setFireworksByID((id + 2), (SendRemainingBalance + SendDestroyIfZero), 0, body2);
    }

    receive(msg: LaunchFirst){
        // prepare 4 messages. wallet v4 contract limited with 4 out messages per tx.
        let dst: Address = msg.launcher;

        // msg1 - sending 0.1 TON with mode = 0
        send(SendParameters{to: dst, value: ton("0.1"), mode: 0, body: "send mode = 0".asComment()});

        // msg2 - sending 0.1 TON with mode = 1
        send(SendParameters{to: dst, value: ton("0.1"), mode: SendPayGasSeparately, body: "send mode = 1".asComment()});

        // msg3 - sending 0.1 TON with mode = 2
        send(SendParameters{to: dst, value: ton("0.1"), mode: SendIgnoreErrors, body: "send mode = 2".asComment()});

        //msg4 - sending remaining 0.1 TON with mode = 128 + 32
        send(SendParameters{to: dst, value: 0, mode: (SendRemainingBalance + SendDestroyIfZero), body: "send mode = 128 + 32".asComment()});
    }

    receive(msg: LaunchSecond){
        let dst: Address = msg.launcher;

        //msg1 mode = 64
        send(SendParameters{to: dst, value: 0, mode: SendRemainingValue, body: "send mode = 64".asComment()});
    }

    receive(msg: FakeLaunch){
        if (msg.exitCode == 0) {
            return ;
        }
        if (msg.exitCode == 2) {
            pop_10();
        }
        if (msg.exitCode == 3) {
            stack_overflow();
        }
        if (msg.exitCode == 4) {
            self.id = 1; // force not to ignore it by using storage variables
            repeat(256) {
                self.id = 2 * self.id;
            }
        }
        if (msg.exitCode == 5) {
            // option 1 -> id: Int as uint32
            self.id = 1; // force not to ignore it by using storage variables
            repeat(32) {
                self.id = 2 * self.id;
            }
            // option 2 -> according to storeUint(self: Builder, value: Int, bits: Int) function, it's not possible to use storeUint(0, 1024) becuase 0 ≤ bits ≤ 256
            let s: Slice = beginCell().storeUint(0, 257).asSlice();
        }
        if (msg.exitCode == 7) {
            type_check_error();
        }
        if (msg.exitCode == 8) {
            // according to storeUint(self: Builder, value: Int, bits: Int) function, it's not possible to use storeUint(0, 1024) becuase 0 ≤ bits ≤ 256
            let s: Slice = beginCell().storeUint(0, 256).storeUint(0, 256).storeUint(0, 256).storeUint(0, 256).asSlice();
        }
        if (msg.exitCode == 9) {
            let s: Slice = emptySlice();
            self.id = s.loadUint(1); // force not to ignore it by using storage variables
        }
        if (msg.exitCode == 10) {
            dict_exit_10();
        }
        if (msg.exitCode == 13) {
            repeat(10000) {
                self.id = self.id + 1;
            }
        }
        if (msg.exitCode == 32) {
            set_c5(beginCell().storeBool(true).endCell());
        }
        if (msg.exitCode == 34) {
            nativeSendMessage(emptyCell(), 0);
        }
        if (msg.exitCode == 37) {
            send(SendParameters{to: context().sender, value: ton("10")});
        }
        if (msg.exitCode == 130) {
            // no need to code here
        }
        if (msg.exitCode == 132) {
            self.requireOwner();
        }
        if (msg.exitCode == 133) {
            self.stopped = true;
            self.requireNotStopped();
        }
        if (msg.exitCode == 134) {
            self.id = beginCell().storeUint(0, 8).asSlice().fromBase64().preloadUint(0); // force not to ignore it by using storage variables
        }
        if (msg.exitCode == 135) {
            // copy & paste the below line in wrapper file(../build/Fireworks/tact_Firework.ts) instead of the second line of Fireworks_init() function - this is a dictionary containing another smart contract code which leads to 135 exit code
            // const __system = Cell.fromBase64('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');
            let ctx: Context = context();
            let fireworks_init: StateInit = initOf Fireworks(0);
        }
        if (msg.exitCode == 136) {
            self.owner = newAddress(1, 0); // 1 is an invalid chain_id(basechain_id : 0)
        }
        if (msg.exitCode == 137) {
            self.owner = newAddress(-1, 0); // masterchain_id : -1
        }
    }

    get fun id(): Int {
        return self.id;
    }
}