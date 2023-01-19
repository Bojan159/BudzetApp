<template>
  <div class="total-budget">
    <div style="flex-direction: column">
      <h2 class="title">
        Trenutni budžet: €
        <span :class="props.trenutniBudzet >= 0 ? 'positive' : 'negative'">
          {{ props.trenutniBudzet }}
        </span>
      </h2>
      <div class="months-list">
        <q-select
          style="margin: 0px 5px"
          bg-color="white"
          outlined
          id="month"
          v-model="state.mjesec"
          :options="MJESECI"
          label="Mjesec"
          @update:model-value="promjenaMjeseca()"
        />
        <q-select
          bg-color="white"
          outlined
          id="year"
          v-model="state.godina"
          :options="state.godine"
          label="Godina"
          @update:model-value="promjenaGodine()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, watch } from "vue";
const trenutnaGodina = new Date().getFullYear();

export default defineComponent({
  name: "BudzetHeader",
  props: [
    "uneseniIznosi",
    "izabraniMjesec",
    "izabranaGodina",
    "trenutniBudzet",
    "uneseniTroskovi",
  ],
  emits: ["promjenaMjesec", "promjenaGodina"],
  setup(props, { emit }) {
    const MJESECI = [
      "Siječanj",
      "Veljača",
      "Ožujak",
      "Travanj",
      "Svibanj",
      "Lipanj",
      "Srpanj",
      "Kolovoz",
      "Rujan",
      "Listopad",
      "Studeni",
      "Prosinac",
    ];
    const state = reactive({
      godine: [trenutnaGodina],
      mjesec: MJESECI[props.izabraniMjesec - 1],
      godina: props.izabranaGodina,
      troskovi: props.uneseniTroskovi,
    });

    const generirajGodine = () => {
      for (let i = 1; i < 6; i++) {
        state.godine.push(trenutnaGodina + i);
      }
    };

    const promjenaMjeseca = () => {
      let mjesec = MJESECI.findIndex((mjesec) => mjesec === state.mjesec) + 1;
      emit("promjenaMjesec", mjesec);
    };

    const promjenaGodine = () => {
      emit("promjenaGodina", state.godina);
    };

    onMounted(() => {
      generirajGodine();
      if (props.uneseniIznosi) {
        izracunBudzeta();
      }
    });

    return { state, props, MJESECI, promjenaMjeseca, promjenaGodine };
  },
});
</script>
<style>
.total-budget {
  display: flex;
  width: 100%;
  height: 35vh;
  justify-content: space-evenly;
  align-items: center;
  background-color: #393e46;
}
.total-budget h2 {
  font-size: 40px;
  color: #ffffff;
}
.positive {
  color: #51da51;
}
.negative {
  color: red;
}

.months-list {
  display: flex;
  color: #ffffff;
}
#month {
  width: 130px;
}
#year {
  width: 70px;
}
.title {
  margin-bottom: 20px;
}
</style>
