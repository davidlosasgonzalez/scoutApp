// Importamos los hooks.
import { useEffect, useRef, useState, useContext } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import useFetch from '../hooks/useFetch';

// Importamos los componentes.
import { Navigate } from 'react-router-dom';

// Importamos el contexto de autenticación.
import { AuthContext } from '../contexts/AuthContext';

// Importamos los componentes.
import Avatar from '../components/Avatar';
import Input from '../components/Input';

// Importamos las variables de entorno.
const { VITE_API_URL } = import.meta.env;

// Función para inicializar el formulario con los datos del usuario.
const initializeForm = (authUser, reset) => {
    if (authUser) {
        reset({
            username: authUser.username,
            email: authUser.email,
        });
    }
};

// Función para actualizar un campo del usuario.
const updateField = async (
    field,
    getValues,
    fetchData,
    authToken,
    authUpdateProfileState,
    setEditingField,
) => {
    const value = getValues(field);

    const body = await fetchData({
        url: `${VITE_API_URL}/api/users`,
        method: 'PUT',
        body: { [field]: value },
        authToken,
        headers: {
            'Content-Type': 'application/json',
        },
        toastId: 'privateProfilePage',
    });

    if (body?.status === 'ok') {
        authUpdateProfileState(body.data.user);
        setEditingField(null);
    }
};

// Función para subir el avatar.
const uploadAvatar = async (
    event,
    fetchData,
    authToken,
    authUpdateProfileState,
) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const body = await fetchData({
        url: `${VITE_API_URL}/api/users/avatar`,
        method: 'PUT',
        body: formData,
        authToken,
        isFormData: true,
        toastId: 'privateProfilePage',
    });

    if (body?.status === 'ok') {
        authUpdateProfileState(body.data.user);
    }
};

// Inicializamos el componente.
const PrivateProfilePage = () => {
    // Extraemos valores del contexto de autenticación.
    const { authToken, authUser, authUpdateProfileState } =
        useContext(AuthContext);

    // Extraemos valores del hook `useFetch`.
    const { fetchData, loading } = useFetch();

    // Referencia para el input de subida de archivos (avatar).
    const fileInputRef = useRef(null);

    // Estado para controlar qué campo está en modo edición.
    const [editingField, setEditingField] = useState(null);

    // Configuración del formulario con `react-hook-form`.
    const methods = useForm({
        defaultValues: {
            username: '',
            email: '',
        },
    });

    // Extraemos métodos útiles de `react-hook-form`.
    const { reset, getValues, setValue } = methods;

    // Cargamos los datos del usuario en el formulario cuando `authUser` esté disponible.
    useEffect(() => {
        initializeForm(authUser, reset);
    }, [authUser, reset]);

    // Si el usuario no está autenticado, lo redirigimos a la página de inicio.
    if (!authUser) return <Navigate to="/" />;

    return (
        <main>
            <h2>Página de perfil privado</h2>

            {/* Utilizamos `FormProvider` para proporcionar los métodos de `react-hook-form`. */}
            <FormProvider {...methods}>
                <form>
                    {/* Sección del avatar. */}
                    <div className="avatar-container">
                        <Avatar
                            avatar={authUser.avatar}
                            username={authUser.username}
                            // Permite cambiar avatar al hacer clic.
                            onClick={() => fileInputRef.current?.click()}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={(e) =>
                                uploadAvatar(
                                    e,
                                    fetchData,
                                    authToken,
                                    authUpdateProfileState,
                                )
                            }
                            // Ocultamos el input de subida de archivos.
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Campo username con botón de edición. */}
                    <div className="input-group">
                        <Input
                            label="Usuario"
                            type="text"
                            name="username"
                            onChange={(e) =>
                                setValue('username', e.target.value)
                            }
                            disabled={editingField !== 'username'}
                        />

                        {editingField === 'username' ? (
                            <button
                                type="button"
                                onClick={() =>
                                    updateField(
                                        'username',
                                        getValues,
                                        fetchData,
                                        authToken,
                                        authUpdateProfileState,
                                        setEditingField,
                                    )
                                }
                                disabled={loading}
                            >
                                Guardar
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditingField('username')}
                            >
                                Editar
                            </button>
                        )}
                    </div>

                    {/* Campo email con botón de edición. */}
                    <div className="input-group">
                        <Input
                            label="Email"
                            type="text"
                            name="email"
                            onChange={(e) => setValue('email', e.target.value)}
                            disabled={editingField !== 'email'}
                        />

                        {editingField === 'email' ? (
                            <button
                                type="button"
                                onClick={() =>
                                    updateField(
                                        'email',
                                        getValues,
                                        fetchData,
                                        authToken,
                                        authUpdateProfileState,
                                        setEditingField,
                                    )
                                }
                                disabled={loading}
                            >
                                Guardar
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditingField('email')}
                            >
                                Editar
                            </button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </main>
    );
};

export default PrivateProfilePage;
