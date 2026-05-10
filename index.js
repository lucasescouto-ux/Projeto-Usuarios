/**
 * Ponto de entrada da aplicação.
 *
 * Responsável por criar o controlador principal da tela de usuários,
 * conectando os formulários de cadastro/edição à tabela exibida na página.
 */

let userController = new UserController(
    "form-user-create",
    "form-user-update",
    "table-users"
);
