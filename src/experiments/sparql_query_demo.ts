// Just to test that TS debugging is set up correctly...
interface ITest {

}

class TestClass implements ITest {
    runTest(): void {
        console.log("hello world!")
        console.log("2!")
    }
}

(new TestClass()).runTest()
