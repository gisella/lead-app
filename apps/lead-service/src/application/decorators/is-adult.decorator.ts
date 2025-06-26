import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const checkIsAdult = (value: string): boolean => {
  if (!value) return false;

  const birthDate = new Date(value);
  const today = new Date();

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18 && age <= 100;
};

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return checkIsAdult(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be at least 18 years old`;
        },
      },
    });
  };
}
