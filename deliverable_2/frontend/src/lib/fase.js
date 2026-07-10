export function getFase(consultazione) {
    if (!consultazione) return 'in_corso';
    const ora = new Date();
    if (consultazione.data_inizio && ora < new Date(consultazione.data_inizio)) return 'in_arrivo';
    if (consultazione.data_fine && ora > new Date(consultazione.data_fine)) return 'conclusa';
    return 'in_corso';
}
