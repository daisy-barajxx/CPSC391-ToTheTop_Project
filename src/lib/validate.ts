export function validateUserInfo(
    username: string,
    password: string,
    name?: string
): Map<string, string> {
    const errors = new Map<string, string>();
    let res: string;

    res = usernameInvalid(username);
    if (res) {
        errors.set("username", res);
    }

    res = passwordInvalid(password);
    if (res) {
        errors.set("password", res);
    }

    if (name != undefined) {
        res = nameInvalid(name);
        if (res) {
            errors.set("name", res);
        }
    }

    return errors;
}

function usernameInvalid(username: string): string {
    if (username.length < 3) {
        return "Username cannot be shorter than 3 characters.";
    }

    if (username.length > 20) {
        return "Username cannot be longer than 20 characters.";
    }

    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;

    if (!usernameRegex.test(username)) {
        return "Username can only contain numbers and letters.";
    }

    return "";
}

function passwordInvalid(password: string): string {
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }

    if (password.length > 64) {
        return "Password cannot be longer than 64 characters.";
    }

    return "";
}

function nameInvalid(name: string): string {
    // Between 1 and 50 characters
    if (name.length < 1) {
        return "Name cannot be shorter than 1 character.";
    }

    if (name.length > 50) {
        return "Name cannot be longer than 50 characters.";
    }

    return "";
}
