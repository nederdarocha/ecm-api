export const helpers = {
  document(document?: string, natural?: boolean): string {
    const _document = document || "";
    const _natural = natural || false;
    if (_natural) return _document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
    return _document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
  },
  phone(phone: string): string {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/g, "($1) $2-$3");
  },
};
