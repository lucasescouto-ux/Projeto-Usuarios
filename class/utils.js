/**
 * Classe utilitária da aplicação.
 *
 * Centraliza métodos auxiliares que podem ser reutilizados em diferentes
 * pontos do projeto, evitando duplicação de código nas classes principais.
 */
class Utils {

    /**
     * Formata uma data no padrão usado na tabela de usuários.
     
      @param {Date} date Data que será formatada.
      @returns {string} Data no formato dia/mês/ano hora:minuto.
     */
    static dateFormat(date) {

        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();

    }

}
