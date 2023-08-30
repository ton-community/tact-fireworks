import "@stdlib/deploy";

message Launch {

}

contract Fireworks with Deployable {
    id: Int as uint32;

    init(id: Int) {
        self.id = id;
    }

    receive(msg: Launch) {

        let ctx: Context = context();

        //msg1 mode = 0

        send(SendParameters{
            to: ctx.sender,
            value: 100000000,
            mode: 0,
            bounce: true,
            body: "send mode = 0".asComment()
        });

        //msg2 mode = 1

        send(SendParameters{
            to: ctx.sender,
            value: 100000000,
            mode: SendPayGasSeparately,
            bounce: true,
            body: "send mode = 1".asComment()
        });

        //msg3 mode = 2

        send(SendParameters{
            to: ctx.sender,
            value: 100000000,
            mode: SendIgnoreErrors,
            bounce: true,
            body: "send mode = 2".asComment()
        });

        //msg4 mode = 128 + 32

        send(SendParameters{
            to: ctx.sender,
            value: 0,
            mode: SendRemainingBalance + SendDestroyIfZero,
            bounce: true,
            body: "send mode = 128 + 32".asComment()
        });

    }

    //code for tests

    get fun id(): Int {
        return self.id;
    }
}
