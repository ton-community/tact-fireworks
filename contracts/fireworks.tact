import "@stdlib/deploy";



message Launch {

}


message LaunchFirst {
    queryId : Int as uint64;
    launcher: Address;
}

message LaunchSecond {
    queryId : Int as uint64;
    launcher: Address;
}

message SetFirst {
    queryId : Int as uint64;
}

contract Fireworks with Deployable {
    id: Int as uint32;
    const ONE_TON: Int = 1000000000;

    init(id: Int) {
        self.id = id;
    }

    receive(msg: SetFirst) { // 0xda1e3345

        let id: Int = self.id();

        let init: StateInit = initOf Fireworks(id + 1);
        let fireworks_address: Address = contractAddress(init);

        //send LaunchFirst message
        send(SendParameters{
            to: fireworks_address,
            value: 1000000000,
            mode: 0,
            bounce: true,
            body: LaunchFirst{
                queryId: id + 1,
                launcher: sender()
                }.toCell(),
            code: init.code,
            data: init.data
        });

       //send LaunchSecond message
        send(SendParameters{
            to: fireworks_address,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: LaunchSecond{
                queryId: id + 2,
                launcher: sender()
                }.toCell(),
            code: init.code,
            data: init.data
        });
    }


    receive(msg: LaunchFirst) {

       // prepare 4 messages

        let dst: Address = msg.launcher;

        // msg1 - sending 0.1 TON with mode = 0

        send(SendParameters{
            to: dst,
            value: 1000000000,
            mode: 0,
            bounce: true,
            body: "send mode = 0".asComment()
        });

        // msg2 - sending 0.1 TON with mode = 1

        send(SendParameters{
            to: dst,
            value: 1000000000,
            mode: SendPayGasSeparately,
            bounce: true,
            body: "send mode = 1".asComment()
        });

        // msg3 - sending 0.1 TON with mode = 2

        send(SendParameters{
            to: dst,
            value: 1000000000,
            mode: SendIgnoreErrors,
            bounce: true,
            body: "send mode = 2".asComment()
        });

        //msg4 - sending remaining 0.1 TON with mode = 32 + 128

        send(SendParameters{
            to: dst,
            value: 1000000000,
            mode: SendRemainingBalance + SendDestroyIfZero,
            bounce: true,
            body: "send mode = 128 + 32".asComment()
        });

    }


   receive(msg: LaunchSecond) { //

        let dst: Address = msg.launcher;

        // prepare a message

        //msg1 mode = 64

        send(SendParameters{
            to: dst,
            value: 0,
            mode: SendRemainingValue,
            bounce: true,
            body: "send mode = 64".asComment()
        });

    }


    get fun id(): Int {
        return self.id;
    }
}
