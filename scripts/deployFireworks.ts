import { toNano } from '@ton/core';
import { Fireworks } from '../wrappers/Fireworks';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const fireworks = provider.open(await Fireworks.fromInit(0n));

    await fireworks.send(
        provider.sender(),
        {
            value: toNano('2'),
        },
        {
            //$$type: 'Deploy',
            $$type:'SetFirst',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(fireworks.address);

    // run methods on `fireworks`
}
