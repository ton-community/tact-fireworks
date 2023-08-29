import { toNano } from 'ton-core';
import { Fireworks } from '../wrappers/Fireworks';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const fireworks = provider.open(await Fireworks.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await fireworks.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(fireworks.address);

    console.log('ID', await fireworks.getId());
}
