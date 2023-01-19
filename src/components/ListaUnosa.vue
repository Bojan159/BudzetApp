<template>
  <div
    class="lista column flex justify-center items-center; container-fluid"
    v-if="props.uneseniIznosi.length > 0"
  >
    <q-card
      class="list-group list"
      style="margin-bottom: 5px"
      v-for="stavka in props.uneseniIznosi"
      :key="stavka.id"
    >
      <q-card-section class="q-pa-md">
        <div class="list-group-item row">
          <div class="text-h6 col">€{{ stavka.iznos }}</div>
          <div class="text-subtitle2 col" style="text-align: right">
            {{ stavka.opis }}
          </div>
          <q-separator color="grey" spaced vertical />
          <div class="text-subtitle2 col">
            {{ stavka.kategorija?.naziv }}
          </div>
          <q-btn
            flat
            round
            color="primary"
            icon="edit"
            @click="emit('edit', stavka)"
          />
          <q-btn
            flat
            round
            color="red"
            icon="delete"
            @click="deleteStavke(stavka.id)"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
  <div v-if="props.uneseniIznosi.length === 0">Nema unesenih podataka!</div>
</template>
<script>
import { deleteDoc, doc } from "@firebase/firestore";
import { db } from "src/boot/firebase";

const { defineComponent } = require("vue");

export default defineComponent({
  name: "ListaUnosa",
  props: ["uneseniIznosi", "kategorije"],
  emits: ["edit"],
  setup(props, { emit }) {
    const deleteStavke = async (id) => {
      await deleteDoc(doc(db, "stavka", id));
    };
    return { props, deleteStavke, emit };
  },
});
</script>
<style>
.container-fluid {
  padding: 0;
}
:host {
  display: block;
  width: 100%;
}

.list-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
