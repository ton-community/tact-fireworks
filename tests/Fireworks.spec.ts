import {Blockchain, printTransactionFees, SandboxContract} from '@ton-community/sandbox';
import { toNano, beginCell } from 'ton-core';
import { Fireworks } from '../wrappers/Fireworks';
import '@ton-community/test-utils';

describe('Fireworks', () => {
    let blockchain: Blockchain;
    let fireworks: SandboxContract<Fireworks>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        fireworks = blockchain.openContract(await Fireworks.fromInit(0n));

        //creating special treasury in Sandbox blockchain space. Treasury is a wallet which owned Toncoins on its balance.
        const deployer = await blockchain.treasury('deployer');

        //sending the 'Deploy' message from treasury to fireworks address to deploy fireworks contract
        const deployResult = await fireworks.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: fireworks.address,
            deploy: true,
            success: true,
        });
    });


    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and fireworks are ready to use
    });

    it('should launch fireworks', async () => {

            const launcher = await blockchain.treasury('fireworks');
            console.log('launcher = ', launcher.address);
            console.log('Fireworks = ', fireworks.address);


            const launchResult = await fireworks.send(
                launcher.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'Launch',
                }
            );

            expect(launchResult.transactions).toHaveTransaction({
                from: launcher.address,
                to: fireworks.address,
                success: true,
            });
    });

    it('should destroy after launching', async () => {

        const launcher = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcher.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: launcher.address,
            to: fireworks.address,
            success: true,
            endStatus: 'non-existing',
            destroyed: true
        });

    });

    it('should be correct Launch op code for the launching', async () => {

        const launcher = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcher.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: launcher.address,
            to: fireworks.address,
            success: true,
            op: 0xa911b47f // 'Launch' op code
        });

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcher.address,
            success: true,
            op: 0 // 0x00000000 - comment op code
        });

    });

    it('should send 4 messages to wallet', async() => {

        const launcher = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcher.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: launcher.address,
            to: fireworks.address,
            success: true,
            outMessagesCount: 4
        });
    })


    it('fireworks contract should send msgs with comments', async() => {

        const launcher = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcher.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcher.address,
            success: true,
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 0").endCell()

        });

            expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcher.address,
            success: true,
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 1").endCell()
        });

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcher.address,
            success: true,
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 2").endCell()
        });

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcher.address,
            success: true,
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 128 + 32").endCell()
        });
    })


    it('should be executed and print fees', async() => {

        const launcher = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcher.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        console.log(printTransactionFees(launchResult.transactions));

    });

    it('should be executed with expected fees', async() => {

        const launcher = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcher.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        //totalFee
        console.log('total fees = ', launchResult.transactions[1].totalFees);

        const tx1 = launchResult.transactions[1];
        if (tx1.description.type !== 'generic') {
            throw new Error('Generic transaction expected');
        }

        //computeFee
        const computeFee = tx1.description.computePhase.type === 'vm' ? tx1.description.computePhase.gasFees : undefined;
        console.log('computeFee = ', computeFee);

        //actionFee
        const actionFee = tx1.description.actionPhase?.totalActionFees;
        console.log('actionFee = ', actionFee);

        //The check, if Compute Phase fees exceed 1 TON
        expect(computeFee).toBeLessThan(toNano('1'));


        // how to check sum of (computeFee + actionFee) lesser than value.


    });

});



