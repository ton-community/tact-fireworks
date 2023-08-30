import {Blockchain, printTransactionFees, SandboxContract} from '@ton-community/sandbox';
import { toNano } from 'ton-core';
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

            const launcherWallet = await blockchain.treasury('increase');


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
});
