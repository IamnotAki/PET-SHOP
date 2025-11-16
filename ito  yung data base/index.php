<?php

session_start();

$errors = [
    'login' => $_SESSION['login_error'] ?? '',
    'register' => $_SESSION['register_error'] ?? ''
];

$activeForm = $_SESSION['active_form'] ?? 'login';

session_unset();

function showError($error) {
    return !empty($error) ? "<p class='error-message'>$error</p>" : '';
}

function isActiveForm($formName, $activeForm) {
    return $formName === $activeForm ? 'active' : '';
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Auth UI</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">
    <!-- LOGIN FORM -->
    <div class="form-box <?= isActiveForm('login', $activeForm); ?>" id="login-form">
        <h2>Login</h2>
        <?= showError($errors['login']); ?>
        <form action="login_register.php" method="POST">
        <input type="hidden" name="form_type" value="login">
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit" name="login" class="btn">Login</button>
        <p>Dont have an account? <a href="#" onclick="showForm('register-form')">Register</a></p>
      </form>
    </div>


    <!-- REGISTER FORM -->
    <div class="form-box <?= isActiveForm('register', $activeForm); ?>" id="register-form">
        <h2>Register</h2>
        <?= showError($errors['register']); ?>
        <form action="login_register.php" method="POST">
        <input type="hidden" name="form_type" value="register">
        <input type="text" name="name" placeholder="Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <select name="role" required>
            <option value="">--Select Role--</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
        </select>
        <button type="submit" name="register" class="btn">Register</button>
    </div>

</div>
<script>
function showForm(formID){
  document.querySelectorAll(".form-box").forEach(form =>form.classList.remove("active"));
  document.getElementById(formID).classList.add("active");
}
</script>
</body>
</html>
