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

    init(id: Int) {
        self.id = id;
    }

    fun setFireworksByID(id:Int, mode: Int, value: Int, body: Cell) {

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
        });
    }

    receive(msg: SetFirst) { // 0xda1e3345

        let id: Int = self.id();

        let body1: Cell = LaunchFirst{ queryId: 0, launcher: sender()}.toCell();
        let body2: Cell = LaunchSecond{ queryId: 0, launcher: sender()}.toCell();

         //set First Fireworks
        self.setFireworksByID(id+1, 0, ton("1"),body1);

       //send LaunchSecond message
        self.setFireworksByID(id+2, SendRemainingBalance + SendDestroyIfZero, 0, body2);

    }


    receive(msg: LaunchFirst) { //0xf1c5c2b7

       // prepare 4 messages. wallet v4 contract limited with 4 out messages per tx.

        let dst: Address = msg.launcher;

        // msg1 - sending 0.1 TON with mode = 0

        send(SendParameters{ //0x282c90a5
            to: dst,
            value: ton("0.1"),
            mode: 0,
            body: "send mode = 0".asComment()
        });

        // msg2 - sending 0.1 TON with mode = 1

        send(SendParameters{
            to: dst,
            value: ton("0.1"),
            mode: SendPayGasSeparately,
            body: "send mode = 1".asComment()
        });

        // msg3 - sending 0.1 TON with mode = 2

        send(SendParameters{
            to: dst,
            value: ton("0.1"),
            mode: SendIgnoreErrors,
            body: "send mode = 2".asComment()
        });

        //msg4 - sending remaining 0.1 TON with mode = 128 + 32

        send(SendParameters{
            to: dst,
            value: 0,
            mode: SendRemainingBalance + SendDestroyIfZero,
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
            body: "send mode = 64".asComment()
        });

    }




    get fun id(): Int {
        return self.id;
    }
}
