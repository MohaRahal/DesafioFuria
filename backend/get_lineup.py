import asyncio
from hltv_async_api import HLTV

# Função assíncrona para buscar a line-up da FURIA
async def get_furia_lineup():
    hltv = HLTV()

    try:
        # Recupera as informações do time FURIA
        team = await hltv.get_team(8297)  # ID da FURIA

        # Extrai os nomes dos jogadores
        players = [player['name'] for player in team['players']]

        return {
            "lineup": players
        }
    except Exception as e:
        return {
            "error": str(e)
        }

# Função principal para execução assíncrona
def main():
    result = asyncio.run(get_furia_lineup())
    print(result)

if __name__ == "__main__":
    main()
