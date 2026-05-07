import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule('../../src/models/operatore.js', () => ({
  Operatore: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

describe('seedRoot utility', () => {
  let createRootOperatore;
  const originalRootPassword = process.env.ROOT_PASSWORD;

  beforeAll(async () => {
    const mod = await import('../../src/utils/seedRoot.js');
    createRootOperatore = mod.createRootOperatore;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ROOT_PASSWORD = originalRootPassword;
  });

  afterAll(() => {
    if (originalRootPassword === undefined) {
      delete process.env.ROOT_PASSWORD;
    } else {
      process.env.ROOT_PASSWORD = originalRootPassword;
    }
  });

  it('termina il processo se ROOT_PASSWORD non è impostata', async () => {
    delete process.env.ROOT_PASSWORD;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit:${code}`);
    });

    await expect(createRootOperatore()).rejects.toThrow('process.exit:1');
    expect(errorSpy).toHaveBeenCalledWith('FATAL: ROOT_PASSWORD required');
    expect(mockFindOne).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('crea l\'utente root usando ROOT_PASSWORD quando non esiste', async () => {
    process.env.ROOT_PASSWORD = 'my_secure_root_password';
    mockFindOne.mockResolvedValueOnce(null);

    await createRootOperatore();

    expect(mockCreate).toHaveBeenCalledWith({
      username: 'root',
      password: 'my_secure_root_password',
      nome: 'Root',
      cognome: 'Admin',
      isRoot: true
    });
  });

  it('non crea un nuovo utente root se già presente', async () => {
    process.env.ROOT_PASSWORD = 'my_secure_root_password';
    mockFindOne.mockResolvedValueOnce({ _id: 'root-id' });

    await createRootOperatore();

    expect(mockCreate).not.toHaveBeenCalled();
  });
});
