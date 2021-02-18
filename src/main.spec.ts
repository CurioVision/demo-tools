import chalk from 'chalk'
import sut = require('./main');

describe('Utils', () => {
    beforeAll(() => (console.log = jest.fn()));

    test('should print the food on the order', () => {
        const food = 'Pizza';
        const drink = 'Coke';
        sut.prepareDemo(food, drink);

        expect(chalk.green).toHaveBeenCalledWith(
            'You ordered the following food: '
        );
        expect(chalk.blue.bold).toHaveBeenCalledWith(food);
    });

    test('should print the drink to the order', () => {
        const food = 'Pizza';
        const drink = 'Coke';
        sut.prepareDemo(food, drink);

        expect(chalk.green).toHaveBeenCalledWith(
            'You ordered the following drink: '
        );
        expect(chalk.blue.bold).toHaveBeenCalledWith(drink);
    });
});
