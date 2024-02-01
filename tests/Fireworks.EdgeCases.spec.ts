import { Blockchain, SandboxContract } from '@ton/sandbox';
import { toNano, ContractProvider, Address, Sender, Contract, } from '@ton/core';
import { Fireworks } from '../wrappers/Fireworks';
import '@ton/test-utils';

enum ExitCode {
    Success = 0,
    StackUnderflow = 2,
    StackOverflow = 3,
    IntegerOverflow = 4,
    IntegerOutOfRange = 5,
    // InvalidOpcode = 6,
    TypeCheckError = 7,
    CellOverflow = 8,
    CellUnderflow = 9,
    DictionaryError = 10,
    OutOfGasError = 13, // output -> -14
    ActionListInvalid = 32,
    ActionInvalid = 34,
    NotEnoughTON = 37,
    // NotEnoughExtraCurrencies = 38,
    // NullReferenceException = 128,
    // InvalidSerializationPrefix = 129,
    InvalidIncomingMessage = 130,
    // ConstraintsError = 131,
    AccessDenied = 132,
    ContractStopped = 133, // output -> 40368
    InvalidArgument = 134,
    CodeNotFound = 135,
    InvalidAddress = 136,
    MasterchainSupportNotEnabled = 137,
}

class FakeFireworks implements Contract {
    readonly address: Address;
    constructor(address: Address) { this.address = address; }
    async send(provider: ContractProvider, via: Sender, value: bigint) { await provider.internal(via, { value }); }
}

describe('Fireworks', () => {
    let blockchain: Blockchain;
    let fireworks: SandboxContract<Fireworks>;
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        fireworks = blockchain.openContract(await Fireworks.fromInit(0n));
        const deployer = await blockchain.treasury('deployer');
        const deployResult = await fireworks.send(deployer.getSender(), { value: toNano('2'), }, { $$type: 'Deploy', queryId: 0n, });
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: fireworks.address,
            deploy: true,
            success: true,
        });
    });

    it('compute phase | exit code = 0', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.Success) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: true, exitCode: ExitCode.Success })
    });

    it('compute phase | exit code = 2', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.StackUnderflow) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.StackUnderflow });
    });

    it('compute phase | exit code = 3', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.StackOverflow) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.StackOverflow })
    });

    it('compute phase | exit code = 4', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.IntegerOverflow) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.IntegerOverflow })
    });

    it('compute phase | exit code = 5', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.IntegerOutOfRange) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.IntegerOutOfRange })
    });

    it('compute phase | exit code = 7', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.TypeCheckError) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.TypeCheckError })
    });

    it('compute phase | exit code = 8', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.CellOverflow) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.CellOverflow })
    });

    it('compute phase | exit code = 9', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.CellUnderflow) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.CellUnderflow })
    });

    it('compute phase | exit code = 10', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.DictionaryError) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.DictionaryError })
    });

    it('compute phase | exit code = 13', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.OutOfGasError) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: -14 })
    });

    it('action phase | exit code = 32', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.ActionListInvalid) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, actionResultCode: ExitCode.ActionListInvalid })
    });

    it('action phase | exit code = 34', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.ActionInvalid) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, actionResultCode: ExitCode.ActionInvalid })
    });

    it('action phase | exit code = 37', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.NotEnoughTON) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, actionResultCode: ExitCode.NotEnoughTON })
    });

    it('Tact compute phase | exit code = 130', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeFireworks = blockchain.openContract(new FakeFireworks(fireworks.address));
        const fakeLaunch = await fakeFireworks.send(faker.getSender(), toNano('0.05'));
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.InvalidIncomingMessage })
    });

    it('Tact compute phase | exit code = 132', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.AccessDenied) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.AccessDenied })
    });

    it('Tact compute phase | exit code = 133', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.ContractStopped) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: 40368 })
    });

    it('Tact compute phase | exit code = 134', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.InvalidArgument) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.InvalidArgument })
    });

    // it('Tact compute phase | exit code = 135', async () => {
    //     const faker = await blockchain.treasury('faker');
    //     const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.CodeNotFound) });
    //     expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.CodeNotFound })
    // });

    it('Tact compute phase | exit code = 136', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.InvalidAddress) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.InvalidAddress })
    });

    it('Tact compute phase | exit code = 137', async () => {
        const faker = await blockchain.treasury('faker');
        const fakeLaunch = await fireworks.send(faker.getSender(), { value: toNano('0.05'), }, { $$type: 'FakeLaunch', exitCode: BigInt(ExitCode.MasterchainSupportNotEnabled) });
        expect(fakeLaunch.transactions).toHaveTransaction({ from: faker.address, to: fireworks.address, success: false, exitCode: ExitCode.MasterchainSupportNotEnabled })
    });
});
