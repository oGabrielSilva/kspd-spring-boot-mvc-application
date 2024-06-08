export class StackValidation {
  public readonly descriptionMaxLen = 300;
  public readonly nameMaxLen = 100;

  public isNameValid(name: string) {
    return name.length <= this.nameMaxLen && name.trim().length >= 1;
  }

  public isNameNonValid(name: string) {
    return !this.isNameValid(name);
  }

  public isDescriptionValid(description: string) {
    return description.length <= this.descriptionMaxLen;
  }

  public isDescriptionNonValid(description: string) {
    return !this.isDescriptionValid(description);
  }
}
