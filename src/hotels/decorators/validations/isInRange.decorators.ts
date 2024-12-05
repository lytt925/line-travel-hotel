import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStringNumberInRange(
  min: number,
  max: number,
  options?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringNumberInRange',
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [min, max],
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const [min, max] = args.constraints;
          const numValue = parseFloat(value);

          return !isNaN(numValue) && numValue >= min && numValue <= max;
        },
        defaultMessage(args: ValidationArguments) {
          const [min, max] = args.constraints;
          return `The field ${args.property} must be a number string between ${min} and ${max}.`;
        },
      },
    });
  };
}
