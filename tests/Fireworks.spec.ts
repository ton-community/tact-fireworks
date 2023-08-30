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

        const deployer = await blockchain.treasury('deployer');

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

            const launcherWallet = await blockchain.treasury('fireworks');
            console.log('launcherWallet = ', launcherWallet.address);
            console.log('Fireworks = ', fireworks.address);


            const launchResult = await fireworks.send(
                launcherWallet.getSender(),
                {
                    value: toNano('1'),
                },
                {
                    $$type: 'Launch',
                }
            );

            expect(launchResult.transactions).toHaveTransaction({
                from: launcherWallet.address,
                to: fireworks.address,
                success: true,
            });

            //const counterAfter = await fireworks.getCounter();

            console.log('launcher transaction details', printTransactionFees(launchResult.transactions));

    });

    it('should destroy after launching', async () => {

        const launcherWallet = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcherWallet.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: launcherWallet.address,
            to: fireworks.address,
            success: true,
            endStatus: 'non-existing',
            destroyed: true
        });

    });

    it('should be correct Launch op code for the launching', async () => {

        const launcherWallet = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcherWallet.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: launcherWallet.address,
            to: fireworks.address,
            success: true,
            op: 0xa911b47f

        });

    });

    it('should send 4 messages to wallet', async() => {

        const launcherWallet = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcherWallet.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: launcherWallet.address,
            to: fireworks.address,
            success: true,
            outMessagesCount: 4
        });
    })


    it('fireworks contract should send msgs with comments', async() => {

        const launcherWallet = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcherWallet.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcherWallet.address,
            success: true,
            op: 0x00000000, // 0x00000000 - comment op code
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 0").endCell()

        });

            expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcherWallet.address,
            success: true,
            op: 0x00000000, // 0x00000000 - comment op code
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 1").endCell()
        });

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcherWallet.address,
            success: true,
            op: 0x00000000, // 0x00000000 - comment op code
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 2").endCell()
        });

        expect(launchResult.transactions).toHaveTransaction({
            from: fireworks.address,
            to: launcherWallet.address,
            success: true,
            op: 0x00000000, // 0x00000000 - comment op code
            body: beginCell().storeUint(0,32).storeStringTail("send mode = 128 + 32").endCell()
        });
    })

    it('should be executed with expected fees', async() => {

        const launcherWallet = await blockchain.treasury('fireworks');

        const launchResult = await fireworks.send(
            launcherWallet.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Launch',
            }
        );

        console.log(printTransactionFees(launchResult.transactions));

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

        expect(computeFee).toBeGreaterThan(actionFee + computeFee);


/*        const computeFees = formatCoins(
            tx.description.computePhase.type === 'vm' ? tx.description.computePhase.gasFees : undefined,
        );*/


    });

});



