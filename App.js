import React, { useState } from 'react';
import { Text, View, Image, ActivityIndicator, Alert, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const CLOUD_NAME = 'lqgvsfnq';
const UPLOAD_PRESET = 'cloudinary-proj11';

const getArquivoUpload = async (arquivo) => {
  if (!arquivo?.uri) {
    throw new Error('Imagem inválida (//_-) !');
  }

  const extensao =
    (arquivo.fileName?.split('.').pop() || 'jpg').toLowerCase();

  const tipo =
    arquivo.mimeType || arquivo.type || 'image/jpeg';

  const nomeArquivo = 
    arquivo.fileName || `upload-${Date.now()}.${extensao}`;

  if (arquivo.uri.startsWith('file://')) {
    return {
      uri: arquivo.uri,
      type: tipo,
      name: nomeArquivo,
    };
  }

  const destino =
    `${FileSystem.cacheDirectory}${Date.now()}-${nomeArquivo}`;

  await FileSystem.copyAsync({
    from: arquivo.uri,
    to: destino,
  });

  return {
    uri: destino,
    type: tipo,
    name: nomeArquivo,
  };
};

export default function UploadImagem() {
  const [imagem, setImagem] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const escolherImagem = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled) setImagem(resultado.assets[0]);
  };

  const enviarCloudinary = async () => {
    if (!imagem) return Alert.alert('Atenção !!!', 'Escolha uma imagem (//_-) !:');

    try {
      setEnviando(true);

      const arquivoUpload = await getArquivoUpload(imagem);

      const formData = new FormData();

      formData.append('file', arquivoUpload);

      formData.append('upload_preset', UPLOAD_PRESET);

      const resposta = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(data?.error?.message || 'Erro no upload');
      }

      setImagens((lista) => [
        {
          id: data.public_id,
          url: data.secure_url,
        },
        ...lista,
      ]);

      setImagem(null);
      
      Alert.alert('Uau uau', 'Imagem enviada! >w<');

    } catch (error) {
      
      console.log('Erro ao enviar imagem:', error);

      Alert.alert('Erro', error?.message || 'Erro desconhecido');

    } finally {
      setEnviando(false);
    }
  };

  const apagarImagem = async (publicId) => {
    try {

      const formData = new FormData();

      formData.append('public_id', publicId);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      const deletar = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,

        {
          method: 'POST',
          body: formData,
        }
      );

      const resultado = await deletar.json();
      console.log('Deletar resultado', resultado);

      if (resultado.result === 'ok'){
        setImagens((prev) => prev.filter((img) => img.public_id !== publicId));
        setImagem((prev) => prev.filter((img) => img.public_id !== publicId));
        Alert.alert('Uau uau','Imagem deletada com sucesso!! >w<');
      }else {
        alert("Erro ao deletar no Cloudinary (-_-)...")
      }
    } catch (error){
      console.log('Erro ao exluir', error);
      Alert.alert('Erro', error?.message || 'Erro não reconhecido');
    }
  }

  const Botao = ({ titulo, onPress, disabled }) => (
    <TouchableOpacity
      onPress = {onPress}
      disabled = {disabled}
      style = {{
        backgroundColor: '#f45d76',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      >
      <Text
        style = {{
          color: '#ffd9df',
          fontSize: 16,
          fontWeight: '600'
        }}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  )

    const BtApagar = () => (
    <TouchableOpacity
      onPress = {apagarImagem}
      style = {{
        backgroundColor: '#f45d76',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        height: 60,
        width: 150,
        margin: 5
      }}
      >
      <Text
        style = {{
          color: '#ffd9df',
          fontSize: 16,
          fontWeight: '600'
        }}
      >
        Apagar Imagem
      </Text>
    </TouchableOpacity>
  )
  
  return (
    <ScrollView contentContainerStyle={{ 
        padding: 20, 
        paddingTop: 60, 
        paddingBottom: 60,
        backgroundColor: '#f8d0d0',
        height: '100%',
        gap: 10,
      }}
    >
      <Text style = {{ fontSize: 26, fontWeight: 'bold', marginBottom: 25, alignSelf: 'center' }}>
        Upload de Imagens
      </Text>

      <Botao titulo="Escolher imagem" onPress={escolherImagem} />

      {imagem && (
        <View style = {{ marginTop: 25, gap: 10 }}>
          
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#f17e91' }}>
            Imagem Escolhida (^ w ^)
          </Text>

          <Image
            source = {{ uri: imagem.uri }}
            style = {{
              width: '100%',
              height: 280,
              borderRadius: 16,
            }}
          />

          <Botao
            titulo = {enviando ? 'Enviando.....' : 'Enviar imagem'}
            onPress = {enviarCloudinary}
            disabled = {enviando}
          />
        </View>
      )}

      {enviando && (
        <View 
          style = {{
            marginVertical: 25,
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size = 'large' />
          <Text style={{ marginTop: 8 }}>
            Enviando imagens
          </Text>

        </View>
      )}

      {imagens.length > 0 && (
        <View
          style = {{
            marginTop: 40,
            flexDirection: 'column'
          }}
        >
          <Text style = {{ fontSize: 22, fontWeight: 'bold', color: '#f9667f' }}>
            (ദ്ദി˙ᗜ˙) Imagens adicionadas (ദ്ദി˙ᗜ˙)
          </Text>

          <Text style = {{ opacity: 0.6, marginVertical: 8, color: '#d1334d' }}>
            {imagens.length} {imagens.length === 1 ? 'imagem' : 'imagens'}
          </Text>

          <FlatList
            data={imagens}
            KeyExtractor = {(item) => item.public_id}
            renderItem = {({ item }) => (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 15,
              }}>
                <Image
                  source = {{
                    uri: item.url,
                  }}
                  style = {{
                    width: '48%',
                    height: 160,
                    borderRadius: 12,
                    margin: 3
                  }}
                />
                <BtApagar/>
              </View>
            )}
          />
            
        </View>
      )};

    </ScrollView>
  );
}